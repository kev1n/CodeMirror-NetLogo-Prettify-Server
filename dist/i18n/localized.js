import { en_us } from './en_us';
import { zh_cn } from './zh_cn';
/** LocalizationManager: Manage all localized texts. */
class LocalizationManager {
    constructor() {
        this.Current = en_us;
    }
    /** Get: Get a localized key. */
    Get(Key, ...Args) {
        var Bundle = this.Current;
        if (!Bundle.hasOwnProperty(Key))
            Bundle = en_us;
        if (!Bundle.hasOwnProperty(Key))
            return Key;
        try {
            return Bundle[Key].apply(this, Args);
        }
        catch {
            return `Error in producing message: ${Key}`;
        }
    }
    /** Switch: Switch to another language. */
    Switch(Locale) {
        switch (Locale.toLowerCase()) {
            case 'zh_cn':
            case 'chinese':
                this.Current = zh_cn;
                break;
            default:
                this.Current = en_us;
                break;
        }
    }
}
export { LocalizationManager };
