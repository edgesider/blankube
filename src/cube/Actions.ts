export type ActionName = keyof typeof Actions

export default class Actions {
    static r = 'r'
    static r_rev = 'r_rev'
    static l = 'l'
    static l_rev = 'l_rev'
    static f = 'f'
    static f_rev = 'f_rev'
    static b = 'b'
    static b_rev = 'b_rev'
    static u = 'u'
    static u_rev = 'u_rev'
    static d = 'd'
    static d_rev = 'd_rev'

    static x = 'x'
    static x_rev = 'x_rev'
    static y = 'y'
    static y_rev = 'y_rev'
    static z = 'z'
    static z_rev = 'z_rev'

    static reset = 'reset'

    static undo = 'undo'
    static redo = 'redo'
}
