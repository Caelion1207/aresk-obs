CREATE TABLE `cycles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`protocolId` varchar(20) NOT NULL DEFAULT 'COM-72-01',
	`status` enum('INIT','EXECUTION','REVIEW','CLOSED','FAILED') NOT NULL DEFAULT 'INIT',
	`triggerType` enum('FOUNDER','COMMAND','SYSTEM','EXTERNAL') NOT NULL,
	`objective` varchar(255) NOT NULL,
	`outcome` json,
	`startedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`scheduledEndAt` datetime NOT NULL,
	`closedAt` datetime,
	CONSTRAINT `cycles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ethicalLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`violatedConstant` varchar(50) NOT NULL,
	`action` varchar(100) NOT NULL,
	`context` text NOT NULL,
	`resolution` enum('BLOCKED','WARNING','OBSERVATION','OVERRIDE') NOT NULL,
	`timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `ethicalLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_cycles_status` ON `cycles` (`status`);--> statement-breakpoint
CREATE INDEX `idx_cycles_timing` ON `cycles` (`startedAt`,`scheduledEndAt`);--> statement-breakpoint
CREATE INDEX `idx_cycles_active` ON `cycles` (`status`,`scheduledEndAt`,`id`);--> statement-breakpoint
CREATE INDEX `idx_eth_constant` ON `ethicalLogs` (`violatedConstant`);--> statement-breakpoint
CREATE INDEX `idx_eth_resolution` ON `ethicalLogs` (`resolution`);