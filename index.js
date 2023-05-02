import mineflayer from 'mineflayer';
import {getYawFrom, length} from "./Vector/vector.js";
import {Process} from "./System/process.js";

const bot = mineflayer.createBot({
    host: 'localhost',
    port: 50004,
    username: 'mybot',
    version: '1.19'
});

bot.once('login', () => setTimeout(start, 100));

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function start() {

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
        }, 50);
        process.createTask((p) => {
            bot.look(getYawFrom(bot.entity.position.x,bot.entity.position.z, x, z), 0, true);
        }, 1000);
        process.createTask((p) => {
            const len = Math.sqrt(bot.entity.velocity.x ** 2 + bot.entity.velocity.z ** 2);
            if (len < 0.05) {
                bot.setControlState('jump', true);
            } else {
                bot.setControlState('jump', false);
            }
        }, 100)
    });
}

