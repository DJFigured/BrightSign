import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createApiKeysWorkflow,
  createProductCategoriesWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[]
    store_id: string
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => ({
              currency_code: currency.currency_code,
              is_default: currency.is_default ?? false,
            })
          ),
        },
      }
    })

    const stores = updateStoresStep(normalizedInput)
    return new WorkflowResponse(stores)
  }
)

export default async function seedBrightSignData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const storeModuleService = container.resolve(Modules.STORE)
  const customerModuleService = container.resolve(Modules.CUSTOMER)

  // ──────────────────────────────────────────────
  // 1. STORE CONFIGURATION
  // ──────────────────────────────────────────────
  logger.info("Setting up BrightSign store...")
  const [store] = await storeModuleService.listStores()

  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "BrightSign Webshop",
  })

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "BrightSign Webshop",
          },
        ],
      },
    })
    defaultSalesChannel = salesChannelResult
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        { currency_code: "czk", is_default: true },
        { currency_code: "eur" },
        { currency_code: "pln" },
      ],
    },
  })

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: "BrightSign.cz",
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  })
  logger.info("Store configured.")

  // ──────────────────────────────────────────────
  // 2. REGIONS (CZ, SK, PL, EU)
  // ──────────────────────────────────────────────
  logger.info("Creating regions...")
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Czech Republic",
          currency_code: "czk",
          countries: ["cz"],
          payment_providers: ["pp_system_default"],
        },
        {
          name: "Slovakia",
          currency_code: "eur",
          countries: ["sk"],
          payment_providers: ["pp_system_default"],
        },
        {
          name: "Poland",
          currency_code: "pln",
          countries: ["pl"],
          payment_providers: ["pp_system_default"],
        },
        {
          name: "European Union",
          currency_code: "eur",
          countries: ["at", "de", "ro", "hu", "nl", "be"],
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  })

  const regionCZ = regionResult.find((r) => r.name === "Czech Republic")!
  const regionSK = regionResult.find((r) => r.name === "Slovakia")!
  const regionPL = regionResult.find((r) => r.name === "Poland")!
  const regionEU = regionResult.find((r) => r.name === "European Union")!
  logger.info(
    `Regions created: CZ(${regionCZ.id}), SK(${regionSK.id}), PL(${regionPL.id}), EU(${regionEU.id})`
  )

  // ──────────────────────────────────────────────
  // 3. TAX REGIONS
  // ──────────────────────────────────────────────
  logger.info("Creating tax regions...")
  const allCountries = ["cz", "sk", "pl", "at", "de", "ro", "hu", "nl", "be"]
  await createTaxRegionsWorkflow(container).run({
    input: allCountries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  })
  logger.info("Tax regions created.")

  // ──────────────────────────────────────────────
  // 4. CUSTOMER GROUPS (B2B tiers)
  // ──────────────────────────────────────────────
  logger.info("Creating customer groups...")
  const customerGroups = await customerModuleService.createCustomerGroups([
    { name: "retail", metadata: { discount_pct: 0, label: "Retail" } },
    {
      name: "b2b_pending",
      metadata: { discount_pct: 0, label: "B2B Pending Validation" },
    },
    {
      name: "b2b_standard",
      metadata: { discount_pct: 10, label: "B2B Standard" },
    },
    {
      name: "b2b_volume",
      metadata: { discount_pct: 15, label: "B2B Volume" },
    },
    {
      name: "b2b_partner",
      metadata: { discount_pct: 20, label: "B2B Partner" },
    },
  ])
  logger.info(
    `Customer groups created: ${customerGroups.map((g) => g.name).join(", ")}`
  )

  // ──────────────────────────────────────────────
  // 5. PRODUCT CATEGORIES
  // ──────────────────────────────────────────────
  logger.info("Creating product categories...")

  // Top-level categories
  const { result: topCategories } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Přehrávače",
          handle: "prehravace",
          is_active: true,
          is_internal: false,
        },
        {
          name: "Příslušenství",
          handle: "prislusenstvi",
          is_active: true,
          is_internal: false,
        },
      ],
    },
  })

  const catPlayers = topCategories.find((c) => c.name === "Přehrávače")!
  const catAccessories = topCategories.find((c) => c.name === "Příslušenství")!

  // Series subcategories under Přehrávače
  const { result: seriesCategories } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Série 5",
          handle: "serie-5",
          is_active: true,
          is_internal: false,
          parent_category_id: catPlayers.id,
        },
        {
          name: "Série 4",
          handle: "serie-4",
          is_active: true,
          is_internal: false,
          parent_category_id: catPlayers.id,
        },
      ],
    },
  })

  const catSeries5 = seriesCategories.find((c) => c.name === "Série 5")!
  const catSeries4 = seriesCategories.find((c) => c.name === "Série 4")!

  // S5 model subcategories
  const { result: s5Categories } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "AU5 Série",
          handle: "au5-serie",
          is_active: true,
          is_internal: false,
          parent_category_id: catSeries5.id,
        },
        {
          name: "LS5 Série",
          handle: "ls5-serie",
          is_active: true,
          is_internal: false,
          parent_category_id: catSeries5.id,
        },
        {
          name: "HD5 Série",
          handle: "hd5-serie",
          is_active: true,
          is_internal: false,
          parent_category_id: catSeries5.id,
        },
        {
          name: "XD5 Série",
          handle: "xd5-serie",
          is_active: true,
          is_internal: false,
          parent_category_id: catSeries5.id,
        },
        {
          name: "XT5 Série",
          handle: "xt5-serie",
          is_active: true,
          is_internal: false,
          parent_category_id: catSeries5.id,
        },
        {
          name: "XC5 Série",
          handle: "xc5-serie",
          is_active: true,
          is_internal: false,
          parent_category_id: catSeries5.id,
        },
      ],
    },
  })

  // Accessory subcategories
  const { result: accessoryCategories } =
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          {
            name: "Napájecí adaptéry",
            handle: "napajeci-adaptery",
            is_active: true,
            is_internal: false,
            parent_category_id: catAccessories.id,
          },
          {
            name: "Wi-Fi moduly",
            handle: "wifi-moduly",
            is_active: true,
            is_internal: false,
            parent_category_id: catAccessories.id,
          },
          {
            name: "Kabely a konektory",
            handle: "kabely-konektory",
            is_active: true,
            is_internal: false,
            parent_category_id: catAccessories.id,
          },
          {
            name: "Paměťové karty",
            handle: "pametove-karty",
            is_active: true,
            is_internal: false,
            parent_category_id: catAccessories.id,
          },
          {
            name: "Ovládací panely",
            handle: "ovladaci-panely",
            is_active: true,
            is_internal: false,
            parent_category_id: catAccessories.id,
          },
        ],
      },
    })

  logger.info(
    `Categories created: ${[...topCategories, ...seriesCategories, ...s5Categories, ...accessoryCategories].map((c) => c.name).join(", ")}`
  )

  // ──────────────────────────────────────────────
  // 6. STOCK LOCATION & FULFILLMENT
  // ──────────────────────────────────────────────
  logger.info("Creating stock location...")
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "COMM-TEC Warehouse",
          address: {
            city: "Pforzheim",
            country_code: "DE",
            address_1: "Am Brauhaus 8",
            postal_code: "75196",
          },
        },
      ],
    },
  })
  const stockLocation = stockLocationResult[0]

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  })

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  })

  // Shipping profile
  const shippingProfiles =
    await fulfillmentModuleService.listShippingProfiles({
      type: "default",
    })
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "BrightSign Shipping",
              type: "default",
            },
          ],
        },
      })
    shippingProfile = shippingProfileResult[0]
  }

  // Fulfillment set with service zones per region
  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "BrightSign Delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Czech Republic",
        geo_zones: [{ country_code: "cz", type: "country" }],
      },
      {
        name: "Slovakia",
        geo_zones: [{ country_code: "sk", type: "country" }],
      },
      {
        name: "Poland",
        geo_zones: [{ country_code: "pl", type: "country" }],
      },
      {
        name: "EU Countries",
        geo_zones: [
          { country_code: "at", type: "country" },
          { country_code: "de", type: "country" },
          { country_code: "ro", type: "country" },
          { country_code: "hu", type: "country" },
          { country_code: "nl", type: "country" },
          { country_code: "be", type: "country" },
        ],
      },
    ],
  })

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  })

  // Shipping zones by name for reference
  const zoneCZ = fulfillmentSet.service_zones.find(
    (z) => z.name === "Czech Republic"
  )!
  const zoneSK = fulfillmentSet.service_zones.find(
    (z) => z.name === "Slovakia"
  )!
  const zonePL = fulfillmentSet.service_zones.find(
    (z) => z.name === "Poland"
  )!
  const zoneEU = fulfillmentSet.service_zones.find(
    (z) => z.name === "EU Countries"
  )!

  // ──────────────────────────────────────────────
  // 7. SHIPPING OPTIONS
  // ──────────────────────────────────────────────
  logger.info("Creating shipping options...")

  const shippingRules = [
    {
      attribute: "enabled_in_store",
      value: "true",
      operator: "eq" as const,
    },
    {
      attribute: "is_return",
      value: "false",
      operator: "eq" as const,
    },
  ]

  await createShippingOptionsWorkflow(container).run({
    input: [
      // CZ: Packeta Pickup
      {
        name: "Packeta - Výdejní místo",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: zoneCZ.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Packeta Pickup",
          description: "Vyzvednutí na výdejním místě Packeta",
          code: "packeta-pickup-cz",
        },
        prices: [
          { currency_code: "czk", amount: 79 },
          { region_id: regionCZ.id, amount: 79 },
        ],
        rules: shippingRules,
      },
      // CZ: Packeta Home Delivery
      {
        name: "Packeta - Doručení na adresu",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: zoneCZ.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Packeta Home",
          description: "Doručení kurýrem na adresu",
          code: "packeta-home-cz",
        },
        prices: [
          { currency_code: "czk", amount: 99 },
          { region_id: regionCZ.id, amount: 99 },
        ],
        rules: shippingRules,
      },
      // SK: Packeta
      {
        name: "Packeta - Doručenie na adresu",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: zoneSK.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Packeta SK",
          description: "Doručenie kuriérom na adresu",
          code: "packeta-home-sk",
        },
        prices: [
          { currency_code: "eur", amount: 5 },
          { region_id: regionSK.id, amount: 5 },
        ],
        rules: shippingRules,
      },
      // PL: Packeta
      {
        name: "Packeta - Dostawa na adres",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: zonePL.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Packeta PL",
          description: "Doręczenie kurierem na adres",
          code: "packeta-home-pl",
        },
        prices: [
          { currency_code: "pln", amount: 25 },
          { region_id: regionPL.id, amount: 25 },
        ],
        rules: shippingRules,
      },
      // EU: Standard Shipping
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: zoneEU.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard EU",
          description: "Standard delivery 3-5 business days",
          code: "standard-eu",
        },
        prices: [
          { currency_code: "eur", amount: 10 },
          { region_id: regionEU.id, amount: 10 },
        ],
        rules: shippingRules,
      },
    ],
  })
  logger.info("Shipping options created.")

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  })

  // ──────────────────────────────────────────────
  // 8. PUBLISHABLE API KEY
  // ──────────────────────────────────────────────
  logger.info("Creating publishable API key...")
  const { data: existingKeys } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: { type: "publishable" },
  })

  let publishableApiKey = existingKeys?.[0]

  if (!publishableApiKey) {
    const {
      result: [keyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "BrightSign Storefront",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    })
    publishableApiKey = keyResult
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  })

  // Retrieve the full key to show the token
  const { data: fullKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token"],
    filters: { id: publishableApiKey.id },
  })

  logger.info("──────────────────────────────────────────────")
  logger.info("PUBLISHABLE API KEY (save this!):")
  logger.info(`  ${fullKeys[0]?.token ?? "check admin dashboard"}`)
  logger.info("──────────────────────────────────────────────")

  logger.info("BrightSign seed completed successfully!")
  logger.info("Summary:")
  logger.info(`  - 4 regions (CZ, SK, PL, EU)`)
  logger.info(`  - 5 customer groups (retail, b2b_pending/standard/volume/partner)`)
  logger.info(
    `  - ${[...topCategories, ...seriesCategories, ...s5Categories, ...accessoryCategories].length} product categories`
  )
  logger.info(`  - 5 shipping options`)
  logger.info(`  - 1 stock location (COMM-TEC Pforzheim)`)
  logger.info(`  - 1 publishable API key`)
}
