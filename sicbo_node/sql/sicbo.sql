DROP TABLE IF EXISTS `banker_record`;
CREATE TABLE `banker_record` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cipher_text` varchar(512) NOT NULL DEFAULT '',
  `record` text,
  `type` enum('chips','dice','init','bet') NOT NULL,
  `created_at` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for game_record
-- ----------------------------
DROP TABLE IF EXISTS `game_record`;
CREATE TABLE `game_record` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `wallet` varchar(255) NOT NULL COMMENT '钱包',
  `bet_balance` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '下注余额',
  `bet_result` tinyint(2) DEFAULT '0' COMMENT '下注结果',
  `game_result` enum('win','lose','wait') NOT NULL DEFAULT 'wait' COMMENT '游戏结果',
  `game_dice` int(4) unsigned NOT NULL COMMENT '游戏点数',
  `created_at` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='游戏记录表';

-- ----------------------------
-- Table structure for player
-- ----------------------------
DROP TABLE IF EXISTS `player`;
CREATE TABLE `player` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `wallet` varchar(255) NOT NULL COMMENT '钱包地址',
  `balance` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '余额',
  `win_balance` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '胜利余额',
  `lose_balance` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '失败余额',
  `win_count` int(10) NOT NULL DEFAULT '0' COMMENT '胜利场次',
  `lose_count` int(10) NOT NULL DEFAULT '0' COMMENT '失败场次',
  `created_at` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ----------------------------
-- Table structure for player_record
-- ----------------------------
DROP TABLE IF EXISTS `player_record`;
CREATE TABLE `player_record` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `wallet` varchar(255) NOT NULL DEFAULT '1',
  `cipher_text` text,
  `used` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '0: 未使用 1: 已使用',
  `created_at` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;