
import { request } from '@/utils/service'

/**
 * 文件下载          
*/
type FileDownload = (name: string) => Promise<{
  code: number
  data: any
}>

export const fileDownoload: FileDownload = (name: string) => {
  return request({
    method: 'get',
    url: '/equipment/downloadfile',
    responseType: 'blob',
    params: {
      name
    }
  })
}






