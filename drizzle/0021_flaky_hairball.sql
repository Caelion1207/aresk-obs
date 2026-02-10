CREATE TABLE `caelionInteractions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`interactionNumber` int NOT NULL,
	`userMessage` text NOT NULL,
	`assistantResponse` text NOT NULL,
	`omegaSem` float NOT NULL,
	`hDiv` float NOT NULL,
	`vLyapunov` float NOT NULL,
	`epsilonEff` float NOT NULL,
	`rld` float NOT NULL,
	`caelionIntervention` boolean NOT NULL DEFAULT false,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `caelionInteractions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `caelionSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`userId` int,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`totalInteractions` int NOT NULL DEFAULT 0,
	`avgOmega` float,
	`avgV` float,
	`avgRLD` float,
	`interventionCount` int NOT NULL DEFAULT 0,
	`status` enum('active','completed','abandoned') NOT NULL DEFAULT 'active',
	`notes` text,
	CONSTRAINT `caelionSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `caelionSessions_sessionId_unique` UNIQUE(`sessionId`)
);
