import { getTranslations } from "@/i18n/server";

export default async function InstructionsPage() {
	const t = await getTranslations("/instructions.page");

	return (
		<div className="mx-auto max-w-4xl px-4 py-8">
			<h1 className="mb-8 text-4xl font-bold tracking-tight text-gray-900">
				{t("title")}
			</h1>
			
			<div className="prose max-w-none">
				<section className="mb-8">
					<h2 className="mb-4 text-2xl font-semibold text-gray-800">
						{t("gettingStarted.title")}
					</h2>
					<p className="mb-4 text-gray-600">
						{t("gettingStarted.description")}
					</p>
					<ol className="list-decimal space-y-2 pl-6">
						<li>{t("gettingStarted.step1")}</li>
						<li>{t("gettingStarted.step2")}</li>
						<li>{t("gettingStarted.step3")}</li>
						<li>{t("gettingStarted.step4")}</li>
					</ol>
				</section>

				<section className="mb-8">
					<h2 className="mb-4 text-2xl font-semibold text-gray-800">
						{t("maintenance.title")}
					</h2>
					<p className="mb-4 text-gray-600">
						{t("maintenance.description")}
					</p>
					<ul className="list-disc space-y-2 pl-6">
						<li>{t("maintenance.tip1")}</li>
						<li>{t("maintenance.tip2")}</li>
						<li>{t("maintenance.tip3")}</li>
						<li>{t("maintenance.tip4")}</li>
					</ul>
				</section>

				<section>
					<h2 className="mb-4 text-2xl font-semibold text-gray-800">
						{t("troubleshooting.title")}
					</h2>
					<p className="mb-4 text-gray-600">
						{t("troubleshooting.description")}
					</p>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="rounded-lg border p-4">
							<h3 className="font-medium text-gray-900">{t("troubleshooting.issue1.title")}</h3>
							<p className="text-sm text-gray-600">{t("troubleshooting.issue1.solution")}</p>
						</div>
						<div className="rounded-lg border p-4">
							<h3 className="font-medium text-gray-900">{t("troubleshooting.issue2.title")}</h3>
							<p className="text-sm text-gray-600">{t("troubleshooting.issue2.solution")}</p>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}