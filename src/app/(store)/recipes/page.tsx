import { getTranslations } from "@/i18n/server";

export default async function RecipesPage() {
	const t = await getTranslations("/recipes.page");

	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			<h1 className="mb-8 text-4xl font-bold tracking-tight text-gray-900">
				{t("title")}
			</h1>
			
			<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				{/* Basic Sourdough Bread */}
				<div className="rounded-lg border bg-white p-6 shadow-sm">
					<h2 className="mb-3 text-xl font-semibold text-gray-900">
						{t("basicBread.title")}
					</h2>
					<p className="mb-4 text-sm text-gray-600">
						{t("basicBread.description")}
					</p>
					<div className="mb-4">
						<h3 className="mb-2 font-medium text-gray-800">{t("ingredients")}</h3>
						<ul className="space-y-1 text-sm text-gray-600">
							<li>• {t("basicBread.ingredient1")}</li>
							<li>• {t("basicBread.ingredient2")}</li>
							<li>• {t("basicBread.ingredient3")}</li>
							<li>• {t("basicBread.ingredient4")}</li>
						</ul>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-gray-500">{t("prepTime")}: {t("basicBread.prepTime")}</span>
						<span className="text-gray-500">{t("difficulty")}: {t("basicBread.difficulty")}</span>
					</div>
				</div>

				{/* Sourdough Pizza Dough */}
				<div className="rounded-lg border bg-white p-6 shadow-sm">
					<h2 className="mb-3 text-xl font-semibold text-gray-900">
						{t("pizzaDough.title")}
					</h2>
					<p className="mb-4 text-sm text-gray-600">
						{t("pizzaDough.description")}
					</p>
					<div className="mb-4">
						<h3 className="mb-2 font-medium text-gray-800">{t("ingredients")}</h3>
						<ul className="space-y-1 text-sm text-gray-600">
							<li>• {t("pizzaDough.ingredient1")}</li>
							<li>• {t("pizzaDough.ingredient2")}</li>
							<li>• {t("pizzaDough.ingredient3")}</li>
							<li>• {t("pizzaDough.ingredient4")}</li>
						</ul>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-gray-500">{t("prepTime")}: {t("pizzaDough.prepTime")}</span>
						<span className="text-gray-500">{t("difficulty")}: {t("pizzaDough.difficulty")}</span>
					</div>
				</div>

				{/* Sourdough Pancakes */}
				<div className="rounded-lg border bg-white p-6 shadow-sm">
					<h2 className="mb-3 text-xl font-semibold text-gray-900">
						{t("pancakes.title")}
					</h2>
					<p className="mb-4 text-sm text-gray-600">
						{t("pancakes.description")}
					</p>
					<div className="mb-4">
						<h3 className="mb-2 font-medium text-gray-800">{t("ingredients")}</h3>
						<ul className="space-y-1 text-sm text-gray-600">
							<li>• {t("pancakes.ingredient1")}</li>
							<li>• {t("pancakes.ingredient2")}</li>
							<li>• {t("pancakes.ingredient3")}</li>
							<li>• {t("pancakes.ingredient4")}</li>
						</ul>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-gray-500">{t("prepTime")}: {t("pancakes.prepTime")}</span>
						<span className="text-gray-500">{t("difficulty")}: {t("pancakes.difficulty")}</span>
					</div>
				</div>
			</div>

			<div className="mt-12 rounded-lg bg-gray-50 p-6">
				<h2 className="mb-4 text-2xl font-semibold text-gray-900">
					{t("tips.title")}
				</h2>
				<div className="grid gap-4 md:grid-cols-2">
					<div>
						<h3 className="mb-2 font-medium text-gray-800">{t("tips.tip1.title")}</h3>
						<p className="text-sm text-gray-600">{t("tips.tip1.description")}</p>
					</div>
					<div>
						<h3 className="mb-2 font-medium text-gray-800">{t("tips.tip2.title")}</h3>
						<p className="text-sm text-gray-600">{t("tips.tip2.description")}</p>
					</div>
				</div>
			</div>
		</div>
	);
}