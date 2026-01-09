ALTER TABLE `sessions` ADD `plantProfile` enum('tipo_a','tipo_b','acoplada') NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` DROP COLUMN `controlMode`;