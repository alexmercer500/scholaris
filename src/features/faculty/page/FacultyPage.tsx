import { TopAppBar } from "@components/layout";
import { NotFound } from "@features/pages/NotFound";

export function FacultyPage() {
    return (
        <>
            <TopAppBar>
                <div>
                    <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">
                        Faculty
                    </h2>
                </div>
            </TopAppBar>
            <NotFound />
        </>
    )
}