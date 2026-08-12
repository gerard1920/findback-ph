import { PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();
  
  const userCount = await db.user.count();
  const itemCount = await db.item.count();
  const categoryCount = await db.category.count();
  const conversationCount = await db.conversation.count();
  const messageCount = await db.message.count();
  const notificationCount = await db.notification.count();
  const reportCount = await db.report.count();
  
  console.log("=== DATABASE STATUS ===");
  console.log(`Users: ${userCount}`);
  console.log(`Items: ${itemCount}`);
  console.log(`Categories: ${categoryCount}`);
  console.log(`Conversations: ${conversationCount}`);
  console.log(`Messages: ${messageCount}`);
  console.log(`Notifications: ${notificationCount}`);
  console.log(`Reports: ${reportCount}`);
  
  const users = await db.user.findMany({
    select: { id: true, email: true, displayName: true, username: true, role: true, status: true }
  });
  console.log("\n=== USERS ===");
  users.forEach(u => console.log(`${u.email} | ${u.displayName} | @${u.username} | ${u.role} | ${u.status}`));
  
  const items = await db.item.findMany({
    select: { id: true, title: true, type: true, status: true, ownerId: true }
  });
  console.log("\n=== ITEMS ===");
  items.forEach(i => console.log(`${i.title} | ${i.type} | ${i.status} | owner: ${i.ownerId}`));
  
  await db.$disconnect();
}

main().catch(console.error);
