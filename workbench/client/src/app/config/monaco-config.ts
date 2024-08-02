import { signal } from '@angular/core';
import { NgxMonacoEditorConfig } from 'ngx-monaco-editor-v2';

export const monaco = signal<any>(null);

export const monacoConfig: NgxMonacoEditorConfig = {
  onMonacoLoad: () => {
    const monaco = (window as any).monaco;
    monaco.languages.register({ id: 'sql' });
    monaco.languages.setMonarchTokensProvider('sql', {
      tokenizer: {
        root: [
          [/\bSELECT\b/, 'keyword'],
          [/\bselect\b/, 'keyword'],
          [/\bFROM\b/, 'keyword'],
          [/\bfrom\b/, 'keyword'],
          [/\bWHERE\b/, 'keyword'],
          [/\bwhere\b/, 'keyword'],
          [/\bAPPROXIMATE\b/, 'keyword'],
          [/\bapproximate\b/, 'keyword'],
          [/\bLIMIT\b/, 'keyword'],
          [/\blimit\b/, 'keyword'],
          // Add other SQL keywords as needed
        ]
      }
    });
    const sqlKeywords = [
      { label: 'SELECT', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'SELECT' },
      { label: 'FROM', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'FROM' },
      { label: 'WHERE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'WHERE' },
      { label: 'APPROXIMATE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'APPROXIMATE' },
      { label: 'LIMIT', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'LIMIT' },
      // { label: 'INSERT', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'INSERT' },
      // { label: 'INTO', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'INTO' },
      // { label: 'UPDATE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'UPDATE' },
      // { label: 'DELETE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'DELETE' }
    ];
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model: any, position: any) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        }).toUpperCase();

        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endLineNumber: position.lineNumber,
          endColumn: word.endColumn
        };

        const suggestions = [];

        if (textUntilPosition.match(/\bSELECT\s*$/)) {
          suggestions.push({
            label: 'APPROXIMATE',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'APPROXIMATE',
            range: range
          });
        }

        // 기본 SQL 키워드 추가
        sqlKeywords.forEach(keyword => {
          suggestions.push({
            ...keyword,
            range: range
          });
        });

        return { suggestions: suggestions };
      }
    });
  },
};
