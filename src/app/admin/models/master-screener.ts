import { Question } from '../../shared/models';

export interface QuestionMeta {
  totalCount: number;
  collapsableCount: number;
  staticCount: number;
  dynamicCount: number;
}

export interface MasterScreener {
  questions: Question[];
  meta: MasterScreenerMetaData;
}

export interface MasterScreenerMetaData {
  versions: number[];
  questions: QuestionMeta;
  screener: {
    version: number;
    created: string;
  };
}
