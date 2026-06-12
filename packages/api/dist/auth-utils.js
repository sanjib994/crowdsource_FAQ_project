export async function requireAuth(req, reply) {
    try {
        await req.jwtVerify();
        return req.user;
    }
    catch {
        reply.status(401).send({ error: 'Unauthenticated' });
        return null;
    }
}
export async function optionalAuth(req) {
    try {
        await req.jwtVerify();
        return req.user;
    }
    catch {
        return null;
    }
}
export async function requireRole(req, reply, roles) {
    const authUser = await requireAuth(req, reply);
    if (!authUser)
        return null;
    if (!authUser.role || !roles.includes(authUser.role)) {
        reply.status(403).send({ error: 'Forbidden' });
        return null;
    }
    return authUser;
}
