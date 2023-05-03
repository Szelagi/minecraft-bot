import mineflayer from 'mineflayer';
import {getYawFrom, length} from "./Vector/vector.js";
import {Process} from "./System/process.js";

const bot = mineflayer.createBot({
    host: 'localhost',
    port: 51405,
    username: 'mybot',
    version: '1.19'
});

bot.once('login', () => setTimeout(start, 1000));

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function start() {
    // while (true) {
        // await wait(1500);
        // await go2D(12.5, -17.5);
        // await wait(1500);
        // await go2D(4.5, -11.5);
        // await wait(1500);
        // await go2D(10.5, -11.5);
    // }

    let nick = "CompleteSurvival";
    while (true) {
        bot.chat(`Idę do ${nick}`);
        await follow2D("CompleteSurvival");
        bot.chat(`EZ`);
        await wait(5000);
    }
}



async function go2D(x, z) {
    return new Promise((resolve, reject) => {
        bot.setControlState('forward', true);
        const process = new Process(resolve, reject, () => {
            bot.setControlState('forward', false);
        });
        process.createTask((p) => {
            if (length(bot.entity.position.x, bot.entity.position.z, x, z) < 0.3)
                p.resolve();
        }, 5);
        process.createTask((p) => {
            bot.look(getYawFrom(bot.entity.position.x,bot.entity.position.z, x, z), 0, true);
        }, 5);
        process.createTask((p) => {
            const len = Math.sqrt(bot.entity.velocity.x ** 2 + bot.entity.velocity.z ** 2);
            if (len < 0.03) {
                bot.setControlState('jump', true);
            } else {
                bot.setControlState('jump', false);
            }
        }, 100)
    });
}

async function follow2D(nick) {
    return new Promise((resolve, reject) => {
        const getX = () => bot.players[nick].entity.position.x;
        const getZ = () => bot.players[nick].entity.position.z;
        bot.setControlState('forward', true);
        bot.setControlState('sprint', true);
        const process = new Process(resolve, reject, () => {
            bot.setControlState('forward', false);
            bot.setControlState('sprint', false);
        });
        // process.createTask((p) => {
        //     if (length(bot.entity.position.x, bot.entity.position.z, getX(), getZ()) < 0.3)
        //         p.resolve();
        // }, 5);
        process.createTask((p) => {
            bot.look(getYawFrom(bot.entity.position.x,bot.entity.position.z, getX(), getZ()), 0, true);
        }, 5);
        process.createTask((p) => {
            const len = Math.sqrt(bot.entity.velocity.x ** 2 + bot.entity.velocity.z ** 2);
            if (len < 0.03) {
                bot.setControlState('jump', true);
            } else {
                bot.setControlState('jump', false);
            }
        }, 100);
        process.createTask((p) => {
            if (length(bot.entity.position.x, bot.entity.position.z, getX(), getZ()) < 10) {
                bot.attack(bot.players[nick].entity);
            }
        }, 750);
    });
}