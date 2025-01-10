import { API_REQUEST_HEADERS, API_URL } from '@/utils/constants'
import { compressImage } from '@/utils/functions'

import { FileLoader } from '@ckeditor/ckeditor5-upload'

class UploadAdapter {
  loader: FileLoader

  /**
   * Initializes a new instance of the constructor.
   *
   * @param {FileLoader} loader - The file loader instance to use during the upload.
   */
  constructor(loader: FileLoader) {
    // The file loader instance to use during the upload.
    this.loader = loader
  }

  // Starts the upload process.
  async upload() {
    return this.loader.file.then(
      (file: any) =>
        new Promise((resolve, reject) => {
          this._sendRequest(resolve, reject, file)
        })
    )
  }

  /**
   * Aborts the upload process.
   */
  abort() {
    //
  }

  /**
   * Sends a request to upload a file.
   *
   * @param {function} resolve - The resolve function of a promise.
   * @param {function} reject - The reject function of a promise.
   * @param {File} file - The file to be uploaded.
   * @return {Promise<void>}
   */
  async _sendRequest(resolve: any, reject: any, file: File): Promise<void> {
    const loader = this.loader

    const headers: {
      'X-API-Key': string
      Authorization?: string
    } = API_REQUEST_HEADERS

    const authStore = useAuthStore()

    headers['Authorization'] = `Bearer ${authStore.accessToken}`

    const data = new FormData()

    const cFile = await compressImage(file, { maxSizeMB: 1 })
    data.append('file', cFile)
    data.append('folder', 'ck')

    axios
      .post(`${API_URL}/file/upload`, data, {
        headers: headers,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total !== null) {
            loader.uploadTotal = progressEvent.total
            loader.uploaded = progressEvent.loaded
          }
        },
      })
      .then(async (response: any) => {
        const result = response.data
        resolve({
          default: result.data.url,
        })
      })
      .catch((err) => {
        reject(err)
      })
  }
}

/**
 * Creates an upload adapter plugin for the given editor.
 *
 * @param {any} editor - The editor to create the upload adapter for.
 * @return {UploadAdapter} The created upload adapter.
 */
export function UploadAdapterPlugin(editor: any): any {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    // Configure the URL to the upload script in your back-end here!
    return new UploadAdapter(loader)
  }
}
