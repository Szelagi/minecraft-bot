export function getYawFrom(botX, botZ, x, z) {
    const vecX = botX - x;
    const vecZ = botZ - z;
    return Math.atan2(vecX, vecZ);
}

export function length(botX, botZ, x, z) {
    const vecX = botX - x;
    const vecZ = botZ - z;
    return Math.sqrt(vecX ** 2 + vecZ ** 2);
}