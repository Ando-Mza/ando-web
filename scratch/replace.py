import sys
import re

with open('src/app/admin/settings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_code = """  // Restablecer Parámetros
  const handleResetParams = () => {
    setShowResetConfirm(true);
  };

  const confirmResetParams = async () => {
    try {
      await resetGeneralParams();
      setMaxImages(8);
      setMaxSlots(3);
      setGracePeriod(5);
      setRequireReview(true);
      setParamError('');
      setShowResetConfirm(false);
      triggerToast('Valores restablecidos a los valores por defecto');
    } catch (err: any) {
      setParamError(err.message || 'Error al restablecer los parámetros');
      setShowResetConfirm(false);
    }
  };"""

content = re.sub(r"  // Restablecer Parámetros.*?^\s*};", new_code, content, count=1, flags=re.MULTILINE | re.DOTALL)


modal_code = """            </div>
          </form>
        )}

        {/* Modal de confirmación para restablecer parámetros */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-slide-up relative">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-full flex-shrink-0 bg-red-50 text-red-600">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-textDark font-wixDisplay">Restablecer Parámetros</h3>
                </div>
                <p className="text-sm text-textDark/70 mb-6">¿Estás seguro de que deseas restablecer todos los parámetros del sistema a sus valores por defecto?</p>
                
                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-textDark/70 hover:bg-black/5 hover:text-textDark transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmResetParams}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-transform hover:-translate-y-0.5 shadow-sm bg-red-600 hover:bg-red-700 shadow-red-600/20"
                  >
                    Sí, Restablecer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}"""

content = content.replace("            </div>\n          </form>\n        )}", modal_code)

with open('src/app/admin/settings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
