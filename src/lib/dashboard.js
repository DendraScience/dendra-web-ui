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
        text: getUnitText('Voltage')
      },
      par: {
        text: getUnitText('MicromolePerSquareFoot'),
        uomId: 'micromole-per-square-foot'
      },
      precipitation: {
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
      par: {
        text: getUnitText('MicromolePerSquareMeter'),
        uomId: 'micromole-per-square-meter'
      },
      precipitation: {
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
