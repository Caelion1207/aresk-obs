CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`messageId` int NOT NULL,
	`coherenciaObservable` float NOT NULL,
	`funcionLyapunov` float NOT NULL,
	`errorCognitivoMagnitud` float NOT NULL,
	`controlActionMagnitud` float NOT NULL,
	`entropiaH` float NOT NULL,
	`coherenciaInternaC` float NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`purpose` text NOT NULL,
	`limits` text NOT NULL,
	`ethics` text NOT NULL,
	`controlMode` enum('controlled','uncontrolled') NOT NULL,
	`controlGain` float NOT NULL DEFAULT 0.5,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
