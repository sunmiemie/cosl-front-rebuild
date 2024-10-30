export const downloadFile = async (url, filename) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf'
        }
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
      const blob = await response.blob()
      const link = document.createElement('a')
      const linkUrl = window.URL.createObjectURL(blob);
      link.href = linkUrl
      link.target = '_blank'
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(linkUrl);
      return true
    } catch (error) {
      return false
    }
  }