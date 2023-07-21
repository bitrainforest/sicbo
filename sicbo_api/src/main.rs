use std::convert::Infallible;
use std::net::SocketAddr;
use std::process::ExitCode;
use std::str::FromStr;
use std::sync::Arc;
use std::time::Duration;

use aleo::CurrentNetwork;
use aleo_rust::{AleoAPIClient, Ciphertext, Network, PrivateKey, Record, ViewKey};
use anyhow::{anyhow, Result};
use clap::Parser;
use hyper::{Body, http, Request, Response, Server};
use hyper::body::Buf;
use hyper::service::{make_service_fn, service_fn};
use mimalloc::MiMalloc;
use serde::de::DeserializeOwned;

#[global_allocator]
static GLOBAL: MiMalloc = MiMalloc;

struct Program {
    name: String,
    private_key: String,
    api: AleoAPIClient<CurrentNetwork>,
}

impl Program {
    fn new(
        name: String,
        private_key: String,
    ) -> Self {
        Self {
            name,
            private_key,
            api: AleoAPIClient::<CurrentNetwork>::testnet3(),
        }
    }

    fn record_decrypt(&self, record_ciphertext: String) -> Result<String> {
        let record_ciphertext = Record::<CurrentNetwork, Ciphertext<CurrentNetwork>>::from_str(&record_ciphertext)?;
        let pk: PrivateKey<CurrentNetwork> = PrivateKey::from_str(&self.private_key)?;
        let vk = ViewKey::try_from(&pk)?;

        let record_plaintext = record_ciphertext.decrypt(&vk)?;
        Ok(record_plaintext.to_string())
    }

    fn get_tx(
        &self,
        tx_id: &str,
        take: usize,
    ) -> Result<Vec<String>> {
        let tx = self.api.get_transaction(<CurrentNetwork as Network>::TransactionID::from_str(tx_id)?)?;

        let records = tx.records()
            .take(take)
            .map(|(_, v)| v.to_string())
            .collect();

        Ok(records)
    }

    fn execute(
        &self,
        function: &str,
        inputs: &[&str],
        fee: &str,
        take: usize,
    ) -> Result<Vec<String>> {
        let mut command = vec![
            "aleo",
            &self.name,
            function,
        ];

        command.extend_from_slice(inputs);

        command.extend_from_slice(&[
            "--fee", fee,
            "--private-key", &self.private_key,
        ]);

        let exec = aleo::commands::Execute::try_parse_from(command)?;
        let tx_id = exec.parse()?;
        let tx_id = tx_id.trim_matches('"');
        println!("{}", tx_id);

        for i in 1..=12 {
            std::thread::sleep(Duration::from_secs(10));

            match self.get_tx(&tx_id, take) {
                Ok(output) => return Ok(output),
                Err(e) => {
                    if i == 12 {
                        return Err(e);
                    } else {
                        println!("call program......")
                    }
                }
            }
        }

        Err(anyhow!("failed to get transaction"))
    }
}

async fn send_chips(
    program: Arc<Program>,
    input: [String; 3],
) -> Result<Vec<String>> {
    tokio::task::spawn_blocking(move || {
        program.execute(
            "send_chips",
            &input.iter().map(|v| v.as_str()).collect::<Vec<&str>>(),
            "1",
            2,
        )
    }).await?
}

async fn set_dice(
    program: Arc<Program>,
    input: [String; 2],
) -> Result<Vec<String>> {
    tokio::task::spawn_blocking(move || {
        program.execute(
            "set_dice",
            &input.iter().map(|v| v.as_str()).collect::<Vec<&str>>(),
            "1",
            1,
        )
    }).await?
}

async fn settlement(
    program: Arc<Program>,
    input: [String; 3],
) -> Result<Vec<String>> {
    tokio::task::spawn_blocking(move || {
        program.execute(
            "settlement",
            &input.iter().map(|v| v.as_str()).collect::<Vec<&str>>(),
            "1",
            2,
        )
    }).await?
}

async fn parse_req_body<Out: DeserializeOwned>(
    body: &mut Body
) -> Result<Out> {
    let body = hyper::body::aggregate(body).await?;
    let out = serde_json::from_reader(body.reader())?;
    Ok(out)
}

async fn router(
    program: Arc<Program>,
    mut req: Request<Body>,
) -> Result<Response<Body>, http::Error> {
    static LOCK: tokio::sync::Mutex<()> = tokio::sync::Mutex::const_new(());
    let path = req.uri().path();

    let res = match path {
        "/sendchips" => async {
            let _guard = LOCK.lock().await;
            let buff = send_chips(program, parse_req_body(req.body_mut()).await?).await?;
            Ok::<_, anyhow::Error>(serde_json::to_vec(&buff)?)
        }.await,
        "/setdice" => async {
            let _guard = LOCK.lock().await;
            let buff = set_dice(program, parse_req_body(req.body_mut()).await?).await?;
            Ok(serde_json::to_vec(&buff)?)
        }.await,
        "/settlement" => async {
            let _guard = LOCK.lock().await;
            let buff = settlement(program, parse_req_body(req.body_mut()).await?).await?;
            Ok(serde_json::to_vec(&buff)?)
        }.await,
        "/decrypt" => async {
            let record_plaintext = program.record_decrypt(parse_req_body(req.body_mut()).await?)?;
            Ok(Vec::from(record_plaintext))
        }.await,
        _ => {
            return Response::builder()
                .status(404)
                .body(Body::empty());
        }
    };

    match res {
        Ok(v) => Ok(Response::new(Body::from(v))),
        Err(e) => {
            eprintln!("{:?}", e);

            Response::builder()
                .status(500)
                .body(Body::from(e.to_string()))
        }
    }
}

fn api_start(
    bind: SocketAddr,
    program: Program,
) -> Result<()> {
    let rt = tokio::runtime::Runtime::new()?;

    rt.block_on(async {
        let program = Arc::new(program);

        let make_service = make_service_fn(move |_| {
            let program = program.clone();

            async move {
                Ok::<_, Infallible>(service_fn(move |req| {
                    router(program.clone(), req)
                }))
            }
        });

        println!("api listening on http://{}", bind);
        Server::try_bind(&bind)?.serve(make_service).await?;
        Ok(())
    })
}

#[derive(Parser)]
#[command(version)]
struct Args {
    #[arg(short, long, default_value = "0.0.0.0:40000")]
    bind: SocketAddr,

    #[arg(short, long)]
    private_key: String,

    #[arg(short, long)]
    program_name: String,
}

fn main() -> ExitCode {
    let args: Args = Args::parse();

    let program = Program::new(
        args.program_name,
        args.private_key,
    );

    match api_start(args.bind, program) {
        Ok(_) => ExitCode::SUCCESS,
        Err(e) => {
            eprintln!("{:?}", e);
            ExitCode::FAILURE
        }
    }
}
