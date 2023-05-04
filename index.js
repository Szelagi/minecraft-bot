import mineflayer from 'mineflayer';
import {getYawFrom, length} from "./Vector/vector.js";
import {Process} from "./System/process.js";




import cluster from 'node:cluster';
import process from 'node:process';

const numCPUs = 8;
const wait = (ms) => new Promise(r => setTimeout(r, ms));

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // Fork workers.

    (async ()=>{
        for (let i = 0; i < numCPUs; i++) {
            await wait(6500);
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
        port: 25565,
        username: `ProcesorCore${Math.floor(Math.random()*10000)}`,
        version: '1.19'
    });

    bot.once('login', () => setTimeout(start, 2000));

    async function start() {
        // while (true) {
        // await wait(1500);
        // await go2D(12.5, -17.5);
        // await wait(1500);
        // await go2D(4.5, -11.5);
        // await wait(1500);
        // await go2D(10.5, -11.5);
        // }

        bot.chat(`/give ${bot.username} diamond_sword`);

        bot.on('respawn', () => {
            bot.chat(`/give ${bot.username} diamond_sword`);
        })


        const players = Object.keys(bot.players).filter(e => (!e.includes('ProcesorCore') && (e != 'Szelagi') ));
        console.log(players)

        const rPlayer = players[Math.floor(Math.random()*players.length)];

        let nick = rPlayer;
        while (true) {
            bot.chat(`Idę do ${nick}`);
            await follow2D(bot, nick);
            bot.chat(`EZ`);
            await wait(5000);
        }
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