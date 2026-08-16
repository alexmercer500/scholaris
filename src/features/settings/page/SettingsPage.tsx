import { TopAppBar } from "@components/layout/TopAppBar";
import { NotFound } from "@features/pages/NotFound";

export function SettingsPage() {
    return (
        <>
            <TopAppBar>
                <div>
                    <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">
                        Settings
                    </h2>
                </div>
            </TopAppBar>
            <NotFound />
        </>
    )
}