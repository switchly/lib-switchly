import { Config } from 'bili'
import * as path from 'path'

const config: Config = {
  plugins: {
    typescript2: {
      cacheRoot: path.join(__dirname, ".rpt2_cache"),
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        include: ['src']
      }
    }
  },
  input: 'src/index.ts',
  output: {
    fileName: 'package.[format].js',
    format: ['cjs', 'esm']
  }
}

export default config