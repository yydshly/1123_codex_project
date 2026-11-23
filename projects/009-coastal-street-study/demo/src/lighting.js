export const lightPresets = {
  afternoon: {
    sky: {
      clearing: .92,
      sun: [.445, .33, -.88],
      colors: {
        horizon: '#c4d7df', upperSky: '#397cb2', sunTint: '#fff8ee',
        highShade: '#a4b8c8', highLight: '#e9edf0', lowShade: '#96a9b9', lowLight: '#f0eeea',
      },
      fogDensity: .00250,
      reflection: ['#82abce', '#d9e5ec', '#c4d7df'],
    },
    sea: {
      offshore: '#2e5969', shallows: '#536f61', skyLight: '#8baaba',
      skyReflection: .77, sunGlint: .145, hazeFalloff: .0092,
    },
    light: { sky: '#dfebf6', ground: '#b1a290', ambient: 1.64, sunColor: '#fff4e5', direct: 1.94 },
    environment: .59,
    exposure: 1.09,
  },
  overcast: {
    sky: {
      clearing: 0,
      sun: [.445, .175, -.88],
      colors: {
        horizon: '#c6cfd0', upperSky: '#c6cfd0', sunTint: '#fff3dc',
        highShade: '#82939e', highLight: '#d1dadc', lowShade: '#4c5c6a', lowLight: '#ccd5d8',
      },
      fogDensity: .0037,
      reflection: ['#a8b7be', '#cbd4d6', '#c6cfd0'],
    },
    sea: {
      offshore: '#3b5963', shallows: '#60766d', skyLight: '#a8b7be',
      skyReflection: 1, sunGlint: 0, hazeFalloff: .0066,
    },
    light: { sky: '#e2ebed', ground: '#9b9385', ambient: 1.74, sunColor: '#eee9dd', direct: .69 },
    environment: .54,
    exposure: 1.06,
  },
};
