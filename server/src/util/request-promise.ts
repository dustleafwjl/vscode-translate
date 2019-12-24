import request from 'request'

// 将request封装成promise
export default function<T>(uri: string, params: request.CoreOptions): Promise<T> {
    return new Promise((resolve, reject) => {
        request(uri, params, (error, res) => {
            if(error) return reject(error)
            if(res.statusCode !== 200) return reject(res.statusMessage)
            resolve(res.body)
        })
    })
}