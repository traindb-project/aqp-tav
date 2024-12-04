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
          [/\bINCREMENTAL\b/, 'keyword'],
          [/\bincremental\b/, 'keyword'],
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
          [/\bLEFT JOIN\b/, 'keyword'],
          [/\bleft join\b/, 'keyword'],
          [/\bRIGHT JOIN\b/, 'keyword'],
          [/\bright join\b/, 'keyword'],
          [/\bJOIN\b/, 'keyword'],
          [/\bjoin\b/, 'keyword'],
          [/\bON\b/, 'keyword'],
          [/\bon\b/, 'keyword'],
          [/\bGROUP BY\b/, 'keyword'],
          [/\bgroup by\b/, 'keyword'],
          // Add other SQL keywords as needed
        ]
      }
    });
    const sqlKeywords = [
      { label: 'INCREMENTAL', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'INCREMENTAL' },
      { label: 'SELECT', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'SELECT' },
      { label: 'FROM', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'FROM' },
      { label: 'WHERE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'WHERE' },
      { label: 'APPROXIMATE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'APPROXIMATE' },
      { label: 'LIMIT', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'LIMIT' },
      { label: 'LEFT JOIN', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'LEFT JOIN' },
      { label: 'RIGHT JOIN', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'RIGHT JOIN' },
      { label: 'JOIN', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'JOIN' },
      { label: 'ON', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'ON' },
      { label: 'GROUP BY', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'GROUP BY' },
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

        if (textUntilPosition.match(/\bINCREMENTAL\s*$\b/)) {
          suggestions.push({
            label: 'SELECT',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'SELECT',
            range
          });
        }

        if (textUntilPosition.match(/\bSELECT\s*$/)) {
          suggestions.push({
            label: 'APPROXIMATE',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'APPROXIMATE',
            range
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
