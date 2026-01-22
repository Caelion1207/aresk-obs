ALTER TABLE `ethicalLogs` ADD `severity` enum('CRITICAL','HIGH','MEDIUM','LOW') NOT NULL;--> statement-breakpoint
ALTER TABLE `ethicalLogs` ADD `cycleId` int;--> statement-breakpoint
ALTER TABLE `ethicalLogs` ADD `actorId` int;--> statement-breakpoint
CREATE INDEX `idx_eth_severity` ON `ethicalLogs` (`severity`);--> statement-breakpoint
CREATE INDEX `idx_eth_cycle` ON `ethicalLogs` (`cycleId`);--> statement-breakpoint
CREATE INDEX `idx_eth_timestamp` ON `ethicalLogs` (`timestamp`);