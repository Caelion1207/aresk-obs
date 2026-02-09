ALTER TABLE `experiments` MODIFY COLUMN `status` enum('running','completed','failed','frozen') NOT NULL DEFAULT 'running';--> statement-breakpoint
ALTER TABLE `experiments` ADD `metadata` json;