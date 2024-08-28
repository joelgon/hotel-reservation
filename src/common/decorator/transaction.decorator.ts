import { ClientSession, startSession } from 'mongoose';

/**
 * Decorator para gerenciar transações do MongoDB com Mongoose.
 */
export function Transaction() {
  return function (...args: [unknown, unknown, PropertyDescriptor]) {
    const descriptor = args[2];
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const session: ClientSession = await startSession();
      session.startTransaction();
      try {
        const result = await originalMethod.apply(this, [...args, session]);

        await session.commitTransaction();
        return result;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    };

    return descriptor;
  };
}
