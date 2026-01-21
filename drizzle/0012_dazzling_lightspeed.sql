CREATE TABLE `argosCosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`tokenCount` int NOT NULL DEFAULT 0,
	`latencyMs` int NOT NULL DEFAULT 0,
	`v_e` float,
	`omega` float,
	`createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `argosCosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `argosCosts` ADD CONSTRAINT `argosCosts_messageId_messages_id_fk` FOREIGN KEY (`messageId`) REFERENCES `messages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_argos_message` ON `argosCosts` (`messageId`);--> statement-breakpoint
CREATE INDEX `idx_argos_composite_analysis` ON `argosCosts` (`messageId`,`v_e`);