CREATE TABLE `system_state` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_id` int NOT NULL,
	`lyapunov` float NOT NULL DEFAULT 0,
	`rld` float NOT NULL DEFAULT 2,
	`siv` float NOT NULL DEFAULT 1,
	`omega` float NOT NULL DEFAULT 1,
	`energy_budget` float NOT NULL DEFAULT 1000,
	`operational_mode` enum('normal','sigilo','debate_constitucional','restriccion_explicita','critical','lockdown') NOT NULL DEFAULT 'normal',
	`cycle_type` enum('simple','long','critical') NOT NULL DEFAULT 'simple',
	`hard_violation_count` int NOT NULL DEFAULT 0,
	`x_ref_valid` boolean NOT NULL DEFAULT true,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_state_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_state_session_id_unique` UNIQUE(`session_id`)
);
--> statement-breakpoint
CREATE TABLE `uadm_decrees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('immutable','configurable') NOT NULL,
	`decree_id` varchar(128) NOT NULL,
	`description` text NOT NULL,
	`threshold` text NOT NULL,
	`status` enum('active','suspended') NOT NULL DEFAULT 'active',
	`modification_reason` text,
	`modified_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uadm_decrees_id` PRIMARY KEY(`id`),
	CONSTRAINT `uadm_decrees_decree_id_unique` UNIQUE(`decree_id`)
);
--> statement-breakpoint
CREATE TABLE `wabun_memory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`previous_hash` varchar(64),
	`current_hash` varchar(64) NOT NULL,
	`event_type` enum('plan_generated','argos_evaluation','hecate_validation','execution_result','metrics_update','constitutional_event','mode_change','decree_modification','founder_authentication','lockdown_triggered') NOT NULL,
	`session_id` int,
	`plan` text,
	`argos_evaluation` text,
	`hecate_validation` text,
	`execution_result` text,
	`metrics` text,
	`constitutional_event` text,
	`operational_mode` enum('normal','sigilo','debate_constitucional','restriccion_explicita','critical','lockdown'),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wabun_memory_id` PRIMARY KEY(`id`)
);
