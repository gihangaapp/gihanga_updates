import { Router, Response } from "express";
import { Setting } from "../../../../models/Setting";
import { Category } from "../../../../models/Category";
import { authenticateStaff, requirePermission, AuthenticatedRequest } from "../../../../middleware/rbac";
import { logAudit } from "../../../../utils/auditLogger";

const router = Router();

// GET /api/v1/system/settings — feature flags + MoMo visibility (superadmin only, per the matrix)
router.get("/", authenticateStaff, requirePermission("settings.view"), async (_req, res: Response) => {
  try {
    const [flags, momoSetting] = await Promise.all([
      Setting.find({ category: "flags" }),
      Setting.findOne({ key: "momo_visible" }),
    ]);
    return res.json({
      flags: flags.map((f) => ({ key: f.key, value: f.value })),
      momoVisible: momoSetting?.value ?? true,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load settings", details: error.message });
  }
});

// PUT /api/v1/system/settings/flags/:key — toggle a feature flag
router.put("/flags/:key", authenticateStaff, requirePermission("settings.featureFlags"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { value } = req.body;
    const setting = await Setting.findOneAndUpdate(
      { key: String(req.params.key) },
      { key: String(req.params.key), value, category: "flags", updatedBy: req.staffUser!.userId },
      { upsert: true, new: true },
    );
    await logAudit({ actor: req.staffUser!.userId, action: "settings.featureFlags", targetId: String(req.params.key), meta: { value } });
    return res.json({ flag: { key: setting.key, value: setting.value } });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update flag", details: error.message });
  }
});

// PUT /api/v1/system/settings/momo-visibility — whether the wallet's deposit/withdraw UI shows for users
router.put("/momo-visibility", authenticateStaff, requirePermission("settings.momo.edit"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { visible } = req.body;
    await Setting.findOneAndUpdate(
      { key: "momo_visible" },
      { key: "momo_visible", value: Boolean(visible), category: "momo", updatedBy: req.staffUser!.userId },
      { upsert: true },
    );
    await logAudit({ actor: req.staffUser!.userId, action: "settings.momo.edit", meta: { visible } });
    return res.json({ momoVisible: Boolean(visible) });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update MoMo visibility", details: error.message });
  }
});

// ── Categories ───────────────────────────────────────────────────────────────

router.get("/categories", authenticateStaff, requirePermission("settings.categories"), async (_req, res: Response) => {
  try {
    const categories = await Category.find({}).sort({ order: 1, name: 1 });
    return res.json({ categories });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load categories", details: error.message });
  }
});

router.post("/categories", authenticateStaff, requirePermission("settings.categories"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, order } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "name is required" });
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const category = await Category.create({ name: name.trim(), slug, description, order: order ?? 0 });
    await logAudit({ actor: req.staffUser!.userId, action: "settings.categories.create", targetId: String(category._id), meta: { name } });
    return res.status(201).json({ category });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to create category", details: error.message });
  }
});

router.patch("/categories/:id", authenticateStaff, requirePermission("settings.categories"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, active, order } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { ...(name !== undefined ? { name } : {}), ...(description !== undefined ? { description } : {}), ...(active !== undefined ? { active } : {}), ...(order !== undefined ? { order } : {}) },
      { new: true },
    );
    if (!category) return res.status(404).json({ error: "Category not found" });
    await logAudit({ actor: req.staffUser!.userId, action: "settings.categories.edit", targetId: String(category._id) });
    return res.json({ category });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update category", details: error.message });
  }
});

router.delete("/categories/:id", authenticateStaff, requirePermission("settings.categories"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(String(req.params.id));
    if (!category) return res.status(404).json({ error: "Category not found" });
    await logAudit({ actor: req.staffUser!.userId, action: "settings.categories.delete", targetId: String(req.params.id) });
    return res.status(204).end();
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete category", details: error.message });
  }
});

export default router;
