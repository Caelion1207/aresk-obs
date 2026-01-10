ALTER TABLE `sessions` ADD `stabilityRadius` float DEFAULT 0.3 NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` ADD `tprCurrent` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` ADD `tprMax` int DEFAULT 0 NOT NULL;