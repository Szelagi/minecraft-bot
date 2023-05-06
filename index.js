import mineflayer from 'mineflayer';
import {getYawFrom, length} from "./Vector/vector.js";
import {Process} from "./System/process.js";

import cluster from 'node:cluster';
import process from 'node:process';

const numCPUs = 1;
const wait = (ms) => new Promise(r => setTimeout(r, ms));

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // Fork workers.

    (async ()=>{
        for (let i = 0; i < numCPUs; i++) {
            //await wait(6500);
            cluster.fork();
        }
    })();

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server

    console.log(`Worker ${process.pid} started`);

    const bot = mineflayer.createBot({
        host: 'localhost',
        port: 55979,
        username: `ProcesorCore`,
        version: '1.19'
    });

    bot.once('login', () => setTimeout(start, 500));

    async function start() {
        await bot.chat('/tp -31.5 -37 -31.5');
        await wait(1000);
        await jump(bot, -31.5, -37, -28.5);

    }
        // while (true) {
        // await wait(1500);
        // await go2D(12.5, -17.5);
        // await wait(1500);
        // await go2D(4.5, -11.5);
        // await wait(1500);
        // await go2D(10.5, -11.5);
        // }

    //     bot.chat(`/give ${bot.username} diamond_sword`);
    //
    //     bot.on('respawn', () => {
    //         bot.chat(`/give ${bot.username} diamond_sword`);
    //     })
    //
    //
    //     const players = Object.keys(bot.players).filter(e => (!e.includes('ProcesorCore') && (e != 'Szelagi') ));
    //     console.log(players)
    //
    //     const rPlayer = players[Math.floor(Math.random()*players.length)];
    //
    //     let nick = rPlayer;
    //     while (true) {
    //         bot.chat(`Idę do ${nick}`);
    //         await follow2D(bot, nick);
    //         bot.chat(`EZ`);
    //         await wait(5000);
    //     }
    // }

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

async function follow2D(bot, nick) {
    return new Promise((resolve, reject) => {
        const getX = () => {
            try {
                if ( Object.keys(bot.players).includes(nick)) {
                    return bot.players[nick].entity.position.x;
                } else {
                    return 0;
                }
            } catch (e) {
                return 0;
            }
        };
        const getZ = () => {
            try {
                if ( Object.keys(bot.players).includes(nick)) {
                    return bot.players[nick].entity.position.z;
                } else {
                    return 0;
                }
            } catch (e) {
                return 0;
            }
        };
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
        }, 500);
        process.createTask((p) => {
            const len = Math.sqrt(bot.entity.velocity.x ** 2 + bot.entity.velocity.z ** 2);
            if (len < 0.03) {
                bot.setControlState('jump', true);
            } else {
                bot.setControlState('jump', false);
            }
        }, 100);
        process.createTask((p) => {
            if (length(bot.entity.position.x, bot.entity.position.z, getX(), getZ()) < 5) {
                bot.attack(bot.players[nick].entity);
            }
        }, 750);
    });
}


async function rotateHead(bot, x, z) {
    await bot.look(getYawFrom(bot.entity.position.x,bot.entity.position.z, x, z), 0, true);
}


async function read(bot, probe, count) {
    const getX = () => bot.entity.position.x;
    const getZ = () => bot.entity.position.z;
    let lastX = getX();
    let lastZ = getZ();
    for(let i = 0; i < count; i++) {
        await wait(probe);
        console.log('x:', lastX-getX(), 'z:', lastZ-getZ());
        lastX = getX();
        lastZ = getZ();
    }
}


async function normalizePosition(bot) {
    // forward = Z-
    // backward = Z+
    // left = X-
    // right = X+
    const SNEAK_SPEED = 1.31;
    const ACCEPTED_DEVIATION = 0.06;
    const getDeviation = (position) => {
        if (position === 0) return 0;
        let comma = position - Math.floor(position);
        if (comma < 0) comma += 1;
        // comma range <0, 1)
        return comma - 0.5;
    }
    const getTime = (deviation) => {
        return (1 / SNEAK_SPEED) * Math.abs(deviation);
    }
    // Normalize X
    const xDeviation = getDeviation(bot.entity.position.x);
    console.log('def', xDeviation)
    if (Math.abs(xDeviation) > ACCEPTED_DEVIATION) {
        const time = getTime(xDeviation);
        await bot.look(0, 0, true);
        await bot.setControlState('sneak', true);
        if (xDeviation > 0) {
            await bot.setControlState('left', true);
            await wait(time*1000);
            await bot.setControlState('left', false);
        } else {
            await bot.setControlState('right', true);
            await wait(time*1000);
            await bot.setControlState('right', false);
        }
        await bot.setControlState('sneak', false);
    }
    const zDeviation = getDeviation(bot.entity.position.z);
    console.log('defz', zDeviation)
    if (Math.abs(zDeviation) > ACCEPTED_DEVIATION) {
        const time = getTime(zDeviation);
        await bot.look(0, 0, true);
        await bot.setControlState('sneak', true);
        if (zDeviation > 0) {
            await bot.setControlState('forward', true);
            await wait(time*1000);
            await bot.setControlState('forward', false);
        } else {
            await bot.setControlState('back', true);
            await wait(time*1000);
            await bot.setControlState('back', false);
        }
        await bot.setControlState('sneak', false);
    }
}

async function jump(bot, x, y, z) {
    await normalizePosition(bot);
    const getX = () => bot.entity.position.x;
    const getZ = () => bot.entity.position.z;
    const jumpLength = length(bot.entity.position.x, bot.entity.position.z, x, z);
    await rotateHead(bot, x, z);
    if (jumpLength < 2) {

    } else {
        bot.setControlState('sprint', true);
        bot.setControlState('forward', true);
        bot.setControlState('jump', true);
        await wait(50);
        bot.setControlState('jump', false);
        await wait(550);
        bot.setControlState('sprint', false);
        bot.setControlState('forward', false);
    }
    // const time = (1 / 7.127) * jumpLength;
    //
    // const extendValue = 0.2;
    // const getXCondition = () => getX() > x-extendValue && getX() < x+extendValue;
    // const TICK_IN_MS = 50;
    // const getZCondition = () => getZ() > z-extendValue && getZ() < z+extendValue;
    // while ( !(getXCondition() && getZCondition()) ) {
    //     console.log(getZCondition())
    //     await wait(50);
    //     console.log(bot.entity.position.z)
    // }

    await wait(1500);
    console.log(bot.entity.position);
}

function getSprintJumpTime(length) {

}

