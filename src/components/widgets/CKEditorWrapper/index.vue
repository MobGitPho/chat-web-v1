<script setup lang="ts">
  // The position of this import is important.
  import FullScreen from '@/components/widgets/CKEditorWrapper/plugins/fullscreen/FullScreen'

  import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment'
  import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat'
  import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold'
  import Code from '@ckeditor/ckeditor5-basic-styles/src/code'
  import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic'
  import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough'
  import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript'
  import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript'
  import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline'
  import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote'
  import '@ckeditor/ckeditor5-build-classic/build/translations/fr'
  import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock'
  import { EditorConfig } from '@ckeditor/ckeditor5-core/src/editor/editorconfig'
  import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor'
  import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials'
  import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace'
  import Font from '@ckeditor/ckeditor5-font/src/font'
  import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily'
  import Heading from '@ckeditor/ckeditor5-heading/src/heading'
  import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline'
  import Image from '@ckeditor/ckeditor5-image/src/image'
  import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption'
  import ImageResizeButtons from '@ckeditor/ckeditor5-image/src/imageresize/imageresizebuttons'
  import ImageResizeEditing from '@ckeditor/ckeditor5-image/src/imageresize/imageresizeediting'
  import ImageResizeHandles from '@ckeditor/ckeditor5-image/src/imageresize/imageresizehandles'
  import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle'
  import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar'
  import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload'
  import Indent from '@ckeditor/ckeditor5-indent/src/indent'
  import Link from '@ckeditor/ckeditor5-link/src/link'
  import List from '@ckeditor/ckeditor5-list/src/list'
  import TodoList from '@ckeditor/ckeditor5-list/src/todolist'
  // import Markdown from '@ckeditor/ckeditor5-markdown-gfm/src/markdown'
  import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed'
  import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat'
  import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting'
  import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters'
  import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials'
  import Table from '@ckeditor/ckeditor5-table/src/table'
  import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption'
  import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties'
  import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties'
  import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar'
  import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation'
  import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter'

  import { UploadAdapterPlugin } from './upload-adapter'

  interface Props {
    modelValue?: string
    disabled?: boolean
    tagName?: string
    placeholder?: string
    lang?: string | null
    minHeight?: number | string
    shouldNotGroupWhenFull?: boolean
    toolbarItems?: string[]
    imageToolbarItems?: string[]
    tableContentToolbar?: string[]
    enableUpload?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    disabled: false,
    tagName: 'div',
    placeholder: '',
    lang: null,
    minHeight: 100,
    shouldNotGroupWhenFull: true,
    toolbarItems: () => [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'code',
      'codeBlock',
      'subscript',
      'superscript',
      'removeFormat',
      'selectAll',
      'specialCharacters',
      '|',
      'fontSize',
      'fontFamily',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'horizontalLine',
      'blockQuote',
      'bulletedList',
      'numberedList',
      'todoList',
      'alignment',
      '|',
      'outdent',
      'indent',
      '|',
      'link',
      'uploadImage',
      'insertTable',
      'mediaEmbed',
      'findAndReplace',
      '|',
      'undo',
      'redo',
      '|',
      'sourceEditing',
      'fullScreen',
    ],
    imageToolbarItems: () => [
      'imageStyle:inline',
      'imageStyle:block',
      'imageStyle:side',
      '|',
      'resizeImage:25',
      'resizeImage:50',
      'resizeImage:75',
      'resizeImage:original',
      '|',
      'toggleImageCaption',
      'imageTextAlternative',
    ],
    tableContentToolbar: () => [
      'toggleTableCaption',
      'tableColumn',
      'tableRow',
      'mergeTableCells',
    ],
    enableUpload: false,
  })

  const emits = defineEmits([
    'update:modelValue',
    'ready',
    'focus',
    'blur',
    'destroy',
  ])

  const editor: any = ClassicEditor

  const { locale } = useI18n()

  const editorConfig = computed<EditorConfig | any>(() => {
    const config: any = {
      language: props.lang || locale.value,
      placeholder: props.placeholder,
      plugins: [
        Essentials,
        Autoformat,
        Bold,
        Italic,
        Underline,
        Strikethrough,
        Code,
        Subscript,
        Superscript,
        BlockQuote,
        Heading,
        Image,
        ImageCaption,
        ImageStyle,
        ImageToolbar,
        ImageUpload,
        ImageResizeEditing,
        ImageResizeHandles,
        ImageResizeButtons,
        Link,
        List,
        Alignment,
        Table,
        TableToolbar,
        TableCaption,
        TableProperties,
        TableCellProperties,
        MediaEmbed,
        Indent,
        TextTransformation,
        CodeBlock,
        FindAndReplace,
        Font,
        FontFamily,
        HorizontalLine,
        TodoList,
        // Markdown,
        RemoveFormat,
        SourceEditing,
        SpecialCharacters,
        SpecialCharactersEssentials,
        FullScreen,
      ],
      extraPlugins: [],
      toolbar: {
        items: props.toolbarItems,
        shouldNotGroupWhenFull: props.shouldNotGroupWhenFull,
      },
      image: {
        toolbar: props.imageToolbarItems,
        resizeOptions: [
          {
            name: 'resizeImage:original',
            value: null,
            icon: 'original',
          },
          {
            name: 'resizeImage:25',
            value: '25',
            icon: 'small',
          },
          {
            name: 'resizeImage:50',
            value: '50',
            icon: 'medium',
          },
          {
            name: 'resizeImage:75',
            value: '75',
            icon: 'large',
          },
        ],
      },
      table: {
        contentToolbar: props.tableContentToolbar,
      },
    }

    if (props.enableUpload) {
      config.extraPlugins.push(UploadAdapterPlugin)
    } else {
      config.plugins.push(Base64UploadAdapter)
    }

    return config
  })

  /*TODO: Find a way to use this variables with v-bind in styles
   * Currently, the v-bind property is applied systematically to the parent
   * element of the ckeditor component, instead of the indexed element.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const minHeight = computed(() =>
    typeof props.minHeight === 'number'
      ? `${props.minHeight}px`
      : props.minHeight
  )
</script>

<template>
  <ckeditor
    :editor="editor"
    :tag-name="props.tagName"
    :disabled="props.disabled"
    :config="editorConfig"
    :model-value="props.modelValue"
    class="page-content-editor"
    @input="emits('update:modelValue', $event)"
    @destroy="emits('destroy', $event)"
    @ready="emits('ready', $event)"
    @focus="emits('focus', $event)"
    @blur="emits('blur', $event)">
  </ckeditor>
</template>

<style>
  .ck.ck-editor__main > .ck-editor__editable {
    min-height: 100px;
  }

  .light-theme .ck.ck-editor__main > .ck-editor__editable {
    background: #ffffff;
    color: rgb(44, 44, 50);
  }

  .dark-theme .ck.ck-editor__main > .ck-editor__editable {
    background: rgb(44, 44, 50);
    color: whitesmoke;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .dark-theme
    .ck.ck-sticky-panel
    > .ck.ck-sticky-panel__content
    > .ck.ck-toolbar {
    background: rgb(24, 24, 28);
    color: whitesmoke;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .dark-theme
    .ck.ck-sticky-panel
    > .ck.ck-sticky-panel__content
    > .ck.ck-toolbar
    > .ck.ck-toolbar__items
    > .ck.ck-button {
    background: rgb(44, 44, 50);
    color: whitesmoke;
  }

  .dark-theme
    .ck.ck-sticky-panel
    > .ck.ck-sticky-panel__content
    > .ck.ck-toolbar
    > .ck.ck-toolbar__items
    > .ck.ck-dropdown
    > .ck.ck-button {
    background: rgb(44, 44, 50);
    color: whitesmoke;
  }

  .ck.ck-balloon-panel.ck-balloon-panel_visible {
    z-index: 20000 !important;
  }
</style>
