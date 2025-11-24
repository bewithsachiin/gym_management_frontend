-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('superadmin', 'admin', 'generaltrainer', 'personaltrainer', 'member', 'housekeeping', 'receptionist', 'manager') NOT NULL DEFAULT 'member';
