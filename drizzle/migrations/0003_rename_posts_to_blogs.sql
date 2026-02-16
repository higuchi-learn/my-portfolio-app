ALTER TABLE `posts` RENAME TO `blogs`;
--> statement-breakpoint
DROP INDEX IF EXISTS `posts_slug_unique`;
--> statement-breakpoint
CREATE UNIQUE INDEX `blogs_slug_unique` ON `blogs` (`slug`);
