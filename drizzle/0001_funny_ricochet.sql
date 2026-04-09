CREATE TABLE `logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`level` enum('info','aviso','erro') NOT NULL,
	`message` text NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `open_positions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pair` varchar(20) NOT NULL,
	`direction` enum('Long','Short') NOT NULL,
	`positionSize` varchar(50) NOT NULL,
	`entryPrice` varchar(50) NOT NULL,
	`currentPrice` varchar(50) NOT NULL,
	`unrealizedPnL` varchar(50) NOT NULL,
	`stopLoss` varchar(50) NOT NULL,
	`takeProfit` varchar(50),
	`operationMode` enum('Normal','Estrategico','Insano') NOT NULL,
	`openedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `open_positions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `robot_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`operationMode` enum('Normal','Estrategico','Insano') NOT NULL DEFAULT 'Normal',
	`isActive` int NOT NULL DEFAULT 0,
	`riskPercentage` int NOT NULL DEFAULT 1,
	`maxLeverage` int NOT NULL DEFAULT 10,
	`bybitApiKey` varchar(255),
	`bybitApiSecret` varchar(255),
	`accountBalance` varchar(50) NOT NULL DEFAULT '0',
	`totalPnL` varchar(50) NOT NULL DEFAULT '0',
	`totalTrades` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `robot_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technical_indicators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pair` varchar(20) NOT NULL,
	`smcScore` int NOT NULL,
	`bosDetected` int NOT NULL DEFAULT 0,
	`chochDetected` int NOT NULL DEFAULT 0,
	`fvgActive` int NOT NULL DEFAULT 0,
	`orderBlocksActive` int NOT NULL DEFAULT 0,
	`operationMode` enum('Normal','Estrategico','Insano') NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `technical_indicators_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trade_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pair` varchar(20) NOT NULL,
	`direction` enum('Long','Short') NOT NULL,
	`entryPrice` varchar(50) NOT NULL,
	`exitPrice` varchar(50) NOT NULL,
	`positionSize` varchar(50) NOT NULL,
	`realizedPnL` varchar(50) NOT NULL,
	`score` int NOT NULL,
	`operationMode` enum('Normal','Estrategico','Insano') NOT NULL,
	`openedAt` timestamp NOT NULL,
	`closedAt` timestamp NOT NULL,
	CONSTRAINT `trade_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `logs` ADD CONSTRAINT `logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `open_positions` ADD CONSTRAINT `open_positions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `robot_configs` ADD CONSTRAINT `robot_configs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `technical_indicators` ADD CONSTRAINT `technical_indicators_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trade_history` ADD CONSTRAINT `trade_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;