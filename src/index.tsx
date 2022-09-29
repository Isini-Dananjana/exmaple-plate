import 'tippy.js/dist/tippy.css'
import './index.css'
import ReactDOM from 'react-dom'
import React from 'react'
import { name } from 'faker'
import randomColor from 'randomcolor'
import { useEffect, useMemo, useState } from 'react'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { withCursors, withYHistory, withYjs, YjsEditor } from '@slate-yjs/core'
import { Editable, Slate, withReact } from 'slate-react'
import { createEditor, Descendant } from 'slate'
import * as Y from 'yjs'
import {
  createPlateUI,
  HeadingToolbar,
  MentionCombobox,
  Plate,
  createAlignPlugin,
  createAutoformatPlugin,
  createBlockquotePlugin,
  createBoldPlugin,
  // createCodeBlockPlugin,
  createCodePlugin,
  createExitBreakPlugin,
  createHeadingPlugin,
  createHighlightPlugin,
  createKbdPlugin,
  createImagePlugin,
  createItalicPlugin,
  createLinkPlugin,
  createListPlugin,
  createMediaEmbedPlugin,
  createNodeIdPlugin,
  createParagraphPlugin,
  createResetNodePlugin,
  createSelectOnBackspacePlugin,
  createSoftBreakPlugin,
  createDndPlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createTablePlugin,
  createTodoListPlugin,
  createTrailingBlockPlugin,
  createUnderlinePlugin,
  createComboboxPlugin,
  createMentionPlugin,
  createIndentPlugin,
  createFontColorPlugin,
  createFontBackgroundColorPlugin,
  createDeserializeMdPlugin,
  createDeserializeCsvPlugin,
  createNormalizeTypesPlugin,
  createFontSizePlugin,
  createHorizontalRulePlugin,
  createPlugins,
  createDeserializeDocxPlugin,
  createJuicePlugin,
} from '@udecode/plate'
import {
  createExcalidrawPlugin,
  ELEMENT_EXCALIDRAW,
  ExcalidrawElement,
} from '@udecode/plate-ui-excalidraw'
import { MarkBallonToolbar, ToolbarButtons } from './config/components/Toolbars'
import { withStyledPlaceHolders } from './config/components/withStyledPlaceHolders'
import { withStyledDraggables } from './config/components/withStyledDraggables'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { MENTIONABLES } from './config/mentionables'
import { CONFIG } from './config/config'
import { VALUES } from './config/values/values'
import { RemoteCursorOverlay } from './Overlay'
import { withMarkdown } from './withMarkdown'

// Migrate to v8 - Part 1: https://www.loom.com/share/71596199ad5a47c2b58cdebab26f4642
// Migrate to v8 - Part 2: https://www.loom.com/share/d85c89220ffa4fe2b6f934a6c6530689
// Migrate to v8 - Part 3: https://www.loom.com/share/c1bf20e18d8a42f8a55f8a28ab605148

const id = 'Examples/Playground'

let components = createPlateUI({
  [ELEMENT_EXCALIDRAW]: ExcalidrawElement,
  // customize your components by plugin key
})
components = withStyledPlaceHolders(components)
components = withStyledDraggables(components)

const Plugins = () => {
  const plugins = createPlugins(
    [
      createParagraphPlugin(),
      createBlockquotePlugin(),
      createTodoListPlugin(),
      createHeadingPlugin(),
      createImagePlugin(),
      createHorizontalRulePlugin(),
      createLinkPlugin(),
      createListPlugin(),
      createTablePlugin(),
      createMediaEmbedPlugin(),
      createExcalidrawPlugin(),
      // createCodeBlockPlugin(),
      createAlignPlugin(CONFIG.align),
      createBoldPlugin(),
      createCodePlugin(),
      createItalicPlugin(),
      createHighlightPlugin(),
      createUnderlinePlugin(),
      createStrikethroughPlugin(),
      createSubscriptPlugin(),
      createSuperscriptPlugin(),
      createFontColorPlugin(),
      createFontBackgroundColorPlugin(),
      createFontSizePlugin(),
      createKbdPlugin(),
      createNodeIdPlugin(),
      createDndPlugin(),
      createIndentPlugin(CONFIG.indent),
      createAutoformatPlugin(CONFIG.autoformat),
      createResetNodePlugin(CONFIG.resetBlockType),
      createSoftBreakPlugin(CONFIG.softBreak),
      createExitBreakPlugin(CONFIG.exitBreak),
      createNormalizeTypesPlugin(CONFIG.forceLayout),
      createTrailingBlockPlugin(CONFIG.trailingBlock),
      createSelectOnBackspacePlugin(CONFIG.selectOnBackspace),
      createComboboxPlugin(),
      createMentionPlugin(),
      createDeserializeMdPlugin(),
      createDeserializeCsvPlugin(),
      createDeserializeDocxPlugin(),
      createJuicePlugin(),
    ],
    {
      components,
    }
  )
  const initialValue = [
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
  ]

  const [value, setValue] = useState(VALUES.playground)

  const [connected, setConnected] = useState(false)

  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        url: 'wss://connect.hocuspocus.cloud',
        parameters: { key: 'write_kSZQXUmhTjEwB5jJOr6h' },
        name: 'slate-yjs-demo',
        onConnect: () => setConnected(true),
        onDisconnect: () => setConnected(false),
        connect: false,
      }),
    []
  )

  console.log(provider)

  const editor = useMemo(() => {
    const cursorData: CursorData = {
      color: randomColor({
        luminosity: 'dark',
        alpha: 1,
        format: 'hex',
      }),
      name: `${name.firstName()} ${name.lastName()}`,
    }
    const sharedType = provider.document.get('content', Y.XmlText)

    return withMarkdown(
      withReact(
        withYHistory(
          withCursors(
            withYjs(createEditor(), sharedType, { autoConnect: false }),
            provider.awareness,
            {
              data: cursorData,
            }
          )
        )
      )
    )
  }, [provider.awareness, provider.document])

  // Connect editor and provider in useEffect to comply with concurrent mode
  // requirements.
  useEffect(() => {
    provider.connect()
    return () => provider.disconnect()
  }, [provider])
  useEffect(() => {
    YjsEditor.connect(editor)
    return () => YjsEditor.disconnect(editor)
  }, [editor])

  //   <React.Fragment>
  //   <Slate value={value} onChange={setValue} editor={editor}>
  //     <RemoteCursorOverlay className="flex justify-center my-32 mx-10">
  //       <FormatToolbar />
  //       <CustomEditable className="max-w-4xl w-full flex-col break-words" />
  //     </RemoteCursorOverlay>
  //     <ConnectionToggle connected={connected} onClick={toggleConnection} />
  //   </Slate>
  // </React.Fragment>
  return (
    <React.Fragment>
      <DndProvider backend={HTML5Backend}>
        <Plate
          id={id}
          editableProps={CONFIG.editableProps}
          // initialValue={VALUES.playground}
          plugins={plugins}
          // value={value}
          value={value}
          onChange={setValue}
        >
          <HeadingToolbar>
            <ToolbarButtons />
          </HeadingToolbar>
          <MarkBallonToolbar />
          <RemoteCursorOverlay className="flex justify-center my-32 mx-10">
            {/* <FormatToolbar /> */}
            {/* <CustomEditable className="max-w-4xl w-full flex-col break-words" /> */}
          </RemoteCursorOverlay>
          {/* <ConnectionToggle connected={connected} onClick={toggleConnection} /> */}
          <MentionCombobox items={MENTIONABLES} />
        </Plate>
      </DndProvider>
    </React.Fragment>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<Plugins />, rootElement)
