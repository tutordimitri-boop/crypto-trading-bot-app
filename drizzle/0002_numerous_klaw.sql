ALTER TABLE `open_positions` MODIFY COLUMN `operationMode` enum('Normal','Estratégico','Insano') NOT NULL;--> statement-breakpoint
ALTER TABLE `robot_configs` MODIFY COLUMN `operationMode` enum('Normal','Estratégico','Insano') NOT NULL DEFAULT 'Normal';--> statement-breakpoint
ALTER TABLE `technical_indicators` MODIFY COLUMN `operationMode` enum('Normal','Estratégico','Insano') NOT NULL;--> statement-breakpoint
ALTER TABLE `trade_history` MODIFY COLUMN `operationMode` enum('Normal','Estratégico','Insano') NOT NULL;