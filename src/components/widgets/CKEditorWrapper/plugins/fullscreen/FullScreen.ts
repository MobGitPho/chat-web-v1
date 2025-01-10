import i18n from '@/i18n'
import Plugin from '@ckeditor/ckeditor5-core/src/plugin'
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview'

import './css/style.css'

const { t } = i18n.global

export default class FullScreen extends Plugin {
  init() {
    const editor = this.editor

    editor.ui.componentFactory.add('fullScreen', (locale) => {
      const view = new ButtonView(locale)
      let etat = 0
      view.set({
        label: t('fullscreen'),
        withText: true,
        tooltip: true,
      })

      view.on('execute', () => {
        if (etat == 1) {
          //@ts-ignore
          editor.sourceElement.nextElementSibling.removeAttribute('id')
          document.body.removeAttribute('id')
          view.set({
            label: t('fullscreen'),
            withText: true,
            tooltip: true,
          })
          etat = 0
        } else {
          //@ts-ignore
          editor.sourceElement.nextElementSibling.setAttribute(
            'id',
            'fullscreeneditor'
          )
          document.body.setAttribute('id', 'fullscreenoverlay')
          view.set({
            label: t('normalSize'),
            withText: true,
            tooltip: true,
          })
          etat = 1
        }
      })

      return view
    })
  }
}
