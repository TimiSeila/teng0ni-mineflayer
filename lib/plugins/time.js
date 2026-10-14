module.exports = inject

function inject (bot) {
  bot.time = {
    clocks: new Map(),
    gameTime: null,
    doDaylightCycle: null,
    bigTime: null,
    time: null,
    timeOfDay: null,
    day: null,
    isDay: null,
    moonPhase: null,
    bigAge: null,
    age: null
  }

  bot._client.on('update_time', (packet) => {
        let time, age, doDaylightCycle

        if (packet.gameTime !== undefined) {
  age = toBigInt(packet.gameTime)
  bot.time.gameTime = age

  for (const clock of packet.clockUpdates ?? []) {
    bot.time.clocks.set(clock.clockId, {
      totalTicks: toBigInt(clock.totalTicks),
      partialTick: clock.partialTick,
      rate: clock.rate,
      lastGameTime: age
    })
  }

  const dayClock = bot.time.clocks.get(0)

  if (!dayClock) return

  // Advance the cached clock using elapsed game ticks.
  const elapsed = age - dayClock.lastGameTime

  if (elapsed > 0n && dayClock.rate !== 0) {
    dayClock.totalTicks += BigInt(
      Math.floor(Number(elapsed) * dayClock.rate)
    )
  }

  dayClock.lastGameTime = age

  time = dayClock.totalTicks
  doDaylightCycle = dayClock.rate !== 0
}

    const finalTime = doDaylightCycle
      ? time
      : (time < 0n ? -time : time)

    bot.time.doDaylightCycle = doDaylightCycle
    bot.time.bigTime = finalTime
    bot.time.time = Number(finalTime)
    bot.time.timeOfDay = Number(((finalTime % 24000n) + 24000n) % 24000n)
    bot.time.day = Number(finalTime / 24000n)
    bot.time.isDay = bot.time.timeOfDay < 13000
    bot.time.moonPhase = ((bot.time.day % 8) + 8) % 8
    bot.time.bigAge = age
    bot.time.age = Number(age)

    bot.emit('time')
  })
}

function toBigInt (value) {
  if (typeof value === 'bigint') return value

  if (Array.isArray(value)) {
    return BigInt.asIntN(
      64,
      (BigInt(value[0]) << 32n) | BigInt(value[1])
    )
  }

  if (typeof value === 'number' || typeof value === 'string') {
    return BigInt(value)
  }

  throw new TypeError(`Unsupported time value: ${value}`)
}
