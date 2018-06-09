import simplex from 'simplex-noise'
export default class TerrainGenerator {
  constructor(height, width, emoji) {
    this.height = height
    this.width = width
    this.emoji = emoji
    this.simplex = new simplex(Math.random)
  }

  noise = (x, y) => this.simplex.noise2D(x, y) / 2 + 0.5

  getBiome = ({ elevation: e, moisture: m }) => {
    if (e < 0.1) return this.emoji['Ocean']
    if (e < 0.12) return this.emoji['Beach']

    if (e > 0.8) {
      if (m < 0.1) return this.emoji['Mountain']
      // if (m < 0.2) return BARE
      if (m < 0.5) return this.emoji['Bare Mountain']
      return this.emoji['Snowy Mountains']
    }

    if (e > 0.6) {
      if (m < 0.33) return this.emoji['Desert']
      // if (m < 0.66) return SHRUBLAND
      return this.emoji['Trees']
    }

    if (e > 0.3) {
      if (m < 0.16) return this.emoji['Desert']
      if (m < 0.5) return this.emoji['Grass']
      if (m < 0.83) return this.emoji['Trees']
      // return TEMPERATE_RAIN_FOREST
    }

    // if (m < 0.16) return SUBTROPICAL_DESERT
    if (m < 0.33) return this.emoji['Grass']
    // if (m < 0.66) return TROPICAL_SEASONAL_FOREST
    return this.emoji['Rain Forest']

    // return this.emoji['Corn']
  }

  generate = () => {
    const { height, width } = this

    let elevation = []
    for (let y = 0; y < height; y++) {
      elevation[y] = []
      for (let x = 0; x < width; x++) {
        let nx = x / width - 0.5,
          ny = y / height - 0.5
        let e =
          1 * this.noise(1 * nx, 1 * ny) +
          0.5 * this.noise(2 * nx, 2 * ny) +
          0.25 * this.noise(4 * nx, 4 * ny)

        let m =
          0.9 * this.noise(0.9 * nx, 0.9 * ny) +
          0.4 * this.noise(2.1 * nx, 2.1 * ny) +
          0.15 * this.noise(4.1 * nx, 4.1 * ny)
        elevation[y][x] = {
          elevation: Math.pow(e, 1.0),
          moisture: Math.pow(m, 1.0),
        }
      }
    }
    return elevation.map((rows, x) =>
      rows.map((cell, y) => ({
        ...cell,
        id: `id-${x}-${y}`,
        biome: this.getBiome(cell),
      })),
    )
  }
}
