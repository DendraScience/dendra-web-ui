export function newCurrent() {
  return {
    airTemperature: null,
    barometricPressure: null,
    batteryVoltage: null,
    meanSeaLevelPressure: null,
    par: null,
    rainfallToday: null,
    rainfallYesterday: null,
    relativeHumidity: null,
    solarRadiation: null,
    windDirection: null,
    windSpeed: null,
    wyPrecipToDate: null
  }
}

export function newForecast() {
  return {
    conditionsIcon: null,
    temperatureMaximum: null,
    temperatureMinimum: null,
    weather: null
  }
}

export function newRainfall() {
  return {
    today: null,
    yesterday: null,
    total7Days: null,
    total14Days: null,
    total30Days: null,
    wyToDate: null
  }
}

// Cumulative rainfall resets at the water year. Sum the rises. A drop starts a new counter.
export function cumulativeIncrease(points) {
  if (!(points && points.length)) return null

  let total = 0
  let prev = points[0][1]

  for (let i = 1; i < points.length; i++) {
    const value = points[i][1]

    if (typeof value !== 'number') continue
    if (typeof prev !== 'number') {
      prev = value
      continue
    }

    if (value > prev) total += value - prev
    prev = value
  }

  return total
}

export const unitsData = {
  imp(getUnitText) {
    return {
      barometricPressure: {
        text: getUnitText('Millibar'),
        uomId: 'millibar'
      },
      batteryVoltage: {
        text: getUnitText('Voltage')
      },
      direction: {
        text: getUnitText('DegreeAngle')
      },
      par: {
        text: getUnitText('MicromolePerSquareFoot'),
        uomId: 'micromole-per-square-foot'
      },
      precipitation: {
        round: 1,
        text: getUnitText('Inch'),
        uomId: 'inch'
      },
      relativeHumidity: {
        text: getUnitText('Percent')
      },
      solarRadiation: {
        text: getUnitText('WattPerSquareFoot'),
        uomId: 'watt-per-square-foot'
      },
      speed: {
        text: getUnitText('MilePerHour'),
        uomId: 'mile-per-hour'
      },
      temperature: {
        text: getUnitText('DegreeFahrenheit'),
        uomId: 'degree-fahrenheit'
      }
    }
  },

  met(getUnitText) {
    return {
      barometricPressure: {
        text: getUnitText('Hectopascal'),
        uomId: 'hectopascal'
      },
      batteryVoltage: {
        text: getUnitText('Voltage')
      },
      direction: {
        text: getUnitText('DegreeAngle')
      },
      par: {
        text: getUnitText('MicromolePerSquareMeter'),
        uomId: 'micromole-per-square-meter'
      },
      precipitation: {
        round: 0,
        text: getUnitText('Millimeter'),
        uomId: 'millimeter'
      },
      relativeHumidity: {
        text: getUnitText('Percent')
      },
      solarRadiation: {
        text: getUnitText('WattPerSquareMeter'),
        uomId: 'watt-per-square-meter'
      },
      speed: {
        text: getUnitText('MeterPerSecond'),
        uomId: 'meter-per-second'
      },
      temperature: {
        text: getUnitText('DegreeCelsius'),
        uomId: 'degree-celsius'
      }
    }
  }
}
