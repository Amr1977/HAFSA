import { prisma } from '../config/database';

export const cleanupExpiredStories = async () => {
  try {
    const result = await prisma.story.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    console.log(`Cleanup: deleted ${result.count} expired stories`);
  } catch (error) {
    console.error('Cleanup expired stories error:', error);
  }
};

const BATCH_SIZE = 1000;
export const cleanupOldPostViews = async () => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const count = await prisma.postView.count({
      where: { viewedAt: { lt: cutoff } },
    });

    let deleted = 0;
    for (let i = 0; i < Math.ceil(count / BATCH_SIZE); i++) {
      const result = await prisma.postView.deleteMany({
        where: { viewedAt: { lt: cutoff } },
      });
      deleted += result.count;
    }
    console.log(`Cleanup: deleted ${deleted} old post views`);
  } catch (error) {
    console.error('Cleanup old post views error:', error);
  }
};

export const startCleanupJobs = () => {
  setInterval(cleanupExpiredStories, 60 * 60 * 1000);
  setInterval(cleanupOldPostViews, 24 * 60 * 60 * 1000);
  cleanupExpiredStories();
};