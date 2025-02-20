const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

class AuthService {
    async hasUser() {
        const count = await prisma.user.count();
        return count > 0;
    }

    async signup(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        });
    }

    async login(username, password) {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            throw new Error('用户不存在');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error('密码错误');
        }

        return user;
    }
}

module.exports = new AuthService(); 