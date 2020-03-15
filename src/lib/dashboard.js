export function newCurrent() {
  return {
    airTemperature: null,
    relativeHumidity: null,
    barometricPressure: null,
    meanSeaLevelPressure: null,
    par: null,
    totalSolar: null,
    rainfallToday: null,
    rainfallYesterday: null,
    wyPrecipToDate: null,
    windSpeed: null
  }
}

export const unitsData = {
  imp(getUnitText) {
    return {
      barometricPressure: {
        text: getUnitText('Millibar'),
        uomId: 'millibar'
      },
      batteryVoltage: {
        text: getUnitText('Voltage'),
        uomId: 'volt'
      },
      par: {
        text: getUnitText('MicromolePerSquareMeter')
      },
      precipitation: {
        text: getUnitText('Inch'),
        uomId: 'inch'
      },
      relativeHumidity: {
        text: getUnitText('Percent')
      },
      solarRadiation: {
        text: getUnitText('WattPerSquareMeter')
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
        text: getUnitText('Millibar'),
        uomId: 'millibar'
      },
      batteryVoltage: {
        text: getUnitText('Voltage'),
        uomId: 'volt'
      },
      par: {
        text: getUnitText('MicromolePerSquareMeter')
      },
      precipitation: {
        text: getUnitText('Millimeter'),
        uomId: 'millimeter'
      },
      relativeHumidity: {
        text: getUnitText('Percent')
      },
      solarRadiation: {
        text: getUnitText('WattPerSquareMeter')
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
