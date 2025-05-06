import { jsPDF } from 'jspdf'
import domtoimage from 'dom-to-image'
import { ref, Ref } from 'vue'

export const isPrinting: Ref<boolean> = ref(false)
export const generatePdf = (fileName, element) => {
  isPrinting.value = true
  /* adjust card colors to make it better visible on white pdf background */
  const $vcards = document.querySelectorAll('.v-card')

  for (const $card of $vcards) {
    $card.classList.add('v-card--print-pdf')
    if ($card.classList.contains('card--greyed-out')) {
      $card.classList.add('card--print-pdf-hidden')
    }
  }

  setTimeout(() => {
    const $targetToPrint = document.querySelector(element)
    if (!$targetToPrint) return

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4',
      putOnlyUsedFonts: true,
    })

    const a4Width = 595
    const a4Height = 842

    // Capture the main element with the specified background color
    domtoimage
      .toJpeg($targetToPrint, { quality: 1.0, bgcolor: 'white' }) /*bgcolor is not a typo here....*/
      .then(function (dataUrl) {
        const img = new Image()
        img.src = dataUrl

        img.onload = () => {
          const imgWidth = img.width
          const imgHeight = img.height
          const imgRatio = imgWidth / imgHeight
          let pdfWidth = a4Width
          let pdfHeight = a4Height

          if (imgWidth > imgHeight) {
            pdfHeight = a4Width / imgRatio
            if (pdfHeight > a4Height) {
              pdfWidth = a4Height * imgRatio
              pdfHeight = a4Height
            }
          } else {
            pdfWidth = a4Height * imgRatio
            if (pdfWidth > a4Width) {
              pdfWidth = a4Width
              pdfHeight = a4Width / imgRatio
            }
          }

          const xOffset = (a4Width - pdfWidth) / 2
          const yOffset = (a4Height - pdfHeight) / 2

          pdf.addImage(dataUrl, 'jpeg', xOffset, yOffset, pdfWidth, pdfHeight)
          pdf.save(fileName)
        }
      })
      .catch(function (error) {
        console.error('Error capturing DOM:', error)
      })
      .finally(() => {
        isPrinting.value = false
        for (const $card of $vcards) {
          $card.classList.remove('v-card--print-pdf')
          if ($card.classList.contains('card--greyed-out')) {
            $card.classList.remove('card--print-pdf-hidden')
          }
        }
      })
  }, 400)
}
