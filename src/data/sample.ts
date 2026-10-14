import sampleCsv from './sample-sponsor-impact.csv?raw'
import errorCsv from './sample-with-errors.csv?raw'

/** Same content as public/sample-data/*.csv, bundled so the demo needs no network request. */
export const SAMPLE_CSV = sampleCsv
export const SAMPLE_FILE_NAME = 'mlai-sample-sponsor-impact.csv'
export const ERROR_SAMPLE_CSV = errorCsv
export const ERROR_SAMPLE_FILE_NAME = 'mlai-sample-with-errors.csv'
