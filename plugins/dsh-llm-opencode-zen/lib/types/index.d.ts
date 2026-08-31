import z from "schemastery";
export declare const name = "@dsh-external/dsh-llm-opencode-zen";
export declare const inject: string[];
export interface Config {
    /** 关闭即从模型选择器整体移除本供应商。 */
    enabled: boolean;
    /** 留空 = keyless 免费模式；填写真实 key 后走正常鉴权（不探测）。 */
    apiKey: string;
    baseURL: string;
    /** 自动同步间隔（毫秒，下限 60s，默认 6h）。 */
    refreshIntervalMs: number;
    /** 额外免费候选 slug（不带 -free 后缀的免费槽位）。 */
    extraSlugs: string[];
}
export declare const Config: z<Schemastery.ObjectS<{
    enabled: z<boolean, boolean>;
    apiKey: z<string, string>;
    baseURL: z<string, string>;
    refreshIntervalMs: z<number, number>;
    extraSlugs: z<string[], string[]>;
}>, Schemastery.ObjectT<{
    enabled: z<boolean, boolean>;
    apiKey: z<string, string>;
    baseURL: z<string, string>;
    refreshIntervalMs: z<number, number>;
    extraSlugs: z<string[], string[]>;
}>>;
export declare function apply(ctx: any, entry: Config): void;
